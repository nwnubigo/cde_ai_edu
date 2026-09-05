import subprocess, json, sys, os
os.chdir('/home/claude/promo')
FONT='/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc'
FONTR='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'

def dur(p):
    return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p]).decode().strip())

def esc(t):
    return t.replace('\\','\\\\').replace(':','\\:').replace("'","\\'").replace('%','\\%')

def build(name, W, H, scenes, vos, ending, hold_last=0.0, vo_tempo=None):
    """scenes: list of (clip_path, seconds, [captions...]) captions=(text, rel_start, rel_end)
       vos: list of (wav, abs_start)"""
    # 1) normalize/trim each clip to exact length, concat
    parts=[]; t=0; drawtexts=[]
    for i,(clip,sec,caps) in enumerate(scenes):
        out=f'out/{name}_s{i}.mp4'
        pad = hold_last if i==len(scenes)-1 else 0
        vf=f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps=30"
        if pad>0: vf+=f",tpad=stop_mode=clone:stop_duration={pad}"
        subprocess.run(['ffmpeg','-y','-v','error','-i',clip,'-t',str(sec+pad),'-vf',vf,'-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p',out],check=True)
        parts.append(out)
        for (txt,a,b) in caps:
            drawtexts.append((txt,t+a,t+b))
        t+=sec+pad
    total=t
    with open(f'out/{name}_list.txt','w') as f:
        for p in parts: f.write(f"file '{os.path.abspath(p)}'\n")
    subprocess.run(['ffmpeg','-y','-v','error','-f','concat','-safe','0','-i',f'out/{name}_list.txt','-c','copy',f'out/{name}_concat.mp4'],check=True)

    # 2) text overlays
    fs=int(H*0.058) if W>H else int(W*0.062)
    filt=[]
    for (txt,a,b) in drawtexts:
        # fade in/out alpha
        alpha=f"if(lt(t,{a}+0.3),(t-{a})/0.3,if(gt(t,{b}-0.3),({b}-t)/0.3,1))"
        filt.append(f"drawtext=fontfile='{FONT}':text='{esc(txt)}':fontsize={fs}:fontcolor=white:borderw={max(2,fs//14)}:bordercolor=black@0.85:box=1:boxcolor=black@0.35:boxborderw={fs//3}:x=(w-text_w)/2:y=h-text_h-{int(H*0.12)}:alpha='{alpha}':enable='between(t,{a},{b})'")
    # ending card: dark overlay + lines
    ea, lines = ending
    filt.append(f"drawbox=x=0:y=0:w=iw:h=ih:color=black@0.62:t=fill:enable='gte(t,{ea})'")
    n=len(lines); gap=int(fs*1.75)
    for k,line in enumerate(lines):
        txt,scale=line[0],line[1]; col=line[2] if len(line)>2 else 'white'; boxc=line[3] if len(line)>3 else None
        f2=int(fs*scale)
        y=f"(h-{n*gap})/2+{k*gap}"
        extra=f":box=1:boxcolor={boxc}:boxborderw={int(f2*0.45)}" if boxc else ""
        filt.append(f"drawtext=fontfile='{FONT if (scale>=0.9 or boxc) else FONTR}':text='{esc(txt)}':fontsize={f2}:fontcolor={col}:x=(w-text_w)/2:y={y}{extra}:enable='gte(t,{ea})'")
    vfilter=','.join(filt)

    # 3) audio mix: narration at offsets
    inputs=['-i',f'out/{name}_concat.mp4']
    afilt=[]; labels=[]
    for j,(wav,st) in enumerate(vos):
        inputs+=['-i',wav]
        tempo = f"atempo={vo_tempo[j]}," if vo_tempo and vo_tempo[j]!=1 else ""
        afilt.append(f"[{j+1}:a]{tempo}aformat=sample_rates=48000:channel_layouts=stereo,volume=1.0,adelay={int(st*1000)}|{int(st*1000)}[a{j}]")
        labels.append(f"[a{j}]")
    afilt.append(f"{''.join(labels)}amix=inputs={len(labels)}:normalize=0:dropout_transition=0,apad=whole_dur={total}[aout]")
    fc=';'.join(afilt)
    outp=f'out/{name}.mp4'
    subprocess.run(['ffmpeg','-y','-v','error',*inputs,'-filter_complex',fc,'-map','0:v','-map','[aout]','-vf',vfilter,'-t',str(total),'-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',outp],check=True)
    print(name, 'done', dur(outp))

if __name__=='__main__':
    which=sys.argv[1]
    if which=='main':
        scenes=[
          ('clips/c1.mp4',8,[('요즘 잘되는 가게, 다 이걸 씁니다',0.5,7.5)]),
          ('clips/c2.mp4',12,[('뭐라고 써야 하지…',0.5,4.2),('사진은 어떻게 만들지…',4.4,8.0),('광고비는 부담되고…',8.2,11.6)]),
          ('clips/c3.mp4',15,[('프롬프트 한 줄, 홍보물 10분 완성',1.0,14.0)]),
          ('clips/c4.mp4',15,[('이론이 아닌 실습 중심',0.3,5.0),('프롬프트·교육자료 단톡방 제공',5.2,10.0),('교육 영상으로 언제든 복습',10.2,14.7)]),
          ('clips/c5.mp4',10,[('AI 활용, 이제 선택이 아니라 필수입니다',0.3,5.0)]),
        ]
        vos=[('vo3/vo1.wav',0.3),('vo3/vo2.wav',8.6),('vo3/vo3.wav',22.0),('vo3/vo4.wav',34.5),('vo3/vo5.wav',51.0)]
        ending=(55.0,[('소상공인 AI 홍보마케팅 교육',1.15),('실습 중심 · 단톡방 자료 제공 · 복습 영상',0.7),('지금 바로 신청하세요',1.0),('소상공인AI홍보마케팅.신청하기.com',0.8,'#1E2433','#FFD84D')])
        build('AI교육_홍보영상_60초_16x9',1920,1080,scenes,vos,ending,vo_tempo=[1,1,1,1.03,1.03])
    else:
        scenes=[
          ('clips/v1.mp4',5,[('요즘 잘되는 가게, 다 이걸 씁니다',0.3,4.8)]),
          ('clips/v2.mp4',7,[('홍보, 막막하셨죠?',0.5,6.5)]),
          ('clips/v3.mp4',8,[('프롬프트 한 줄, 홍보물 10분 완성',0.5,7.5)]),
          ('clips/v4.mp4',6,[('실습 위주 · 단톡방 자료 · 복습 영상',0.3,5.7)]),
          ('clips/v5.mp4',4,[('선택이 아니라 필수입니다',0.3,3.5)]),
        ]
        vos=[('vo3/vo11.wav',0.3),('vo3/vo12.wav',5.5),('vo3/vo13.wav',12.2),('vo3/vo14.wav',20.3),('vo3/vo15.wav',26.2)]
        ending=(29.5,[('소상공인 AI 홍보마케팅 교육',1.05),('실습 중심 · 단톡방 자료 · 복습 영상',0.62),('지금 바로 신청하세요',0.95),('소상공인AI홍보마케팅.신청하기.com',0.6,'#1E2433','#FFD84D')])
        build('AI교육_홍보영상_30초_9x16',1080,1920,scenes,vos,ending,hold_last=3.5)
