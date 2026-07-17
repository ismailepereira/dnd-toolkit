# videobot — baixador + editor de vídeo

Automação de "baixar e editar" operada pelo Claude via skill **/video**:
você pede pelo chat (funciona do celular), o Claude roda este script e te
devolve o arquivo pronto.

## Como usar pelo celular

Abra uma sessão do Claude Code neste repositório (app ou claude.ai/code) e
peça em português normal, por exemplo:

> baixa esse vídeo https://youtube.com/... , corta do 0:30 ao 1:20,
> deixa vertical com o título "Sessão 12" e comprime pra WhatsApp

O Claude devolve o `.mp4` no próprio chat — é só salvar no celular.

## Requisito (sessões remotas)

A política de rede do ambiente no claude.ai/code precisa permitir o site
do vídeo. Para YouTube, libere `youtube.com`, `*.googlevideo.com` e
`*.ytimg.com` (ou use a política de acesso total à rede). A **edição** de
arquivos já baixados funciona mesmo com a rede restrita.

## Uso direto (sem Claude)

```bash
pip install yt-dlp            # e tenha o ffmpeg no PATH
python videobot.py auto "URL" --cortar 0:30-1:20 --vertical \
  --texto "Título" --comprimir-mb 16 --nome resultado
```

Rode `python videobot.py --help` (e `editar --help`) para todas as opções:
cortes múltiplos emendados, vertical 9:16 / quadrado 1:1 com fundo
desfocado, velocidade, texto sobreposto, fade, volume/mudo, compressão
para um tamanho-alvo (WhatsApp: 16 MB), extração de MP3 e geração de GIF.

Os vídeos gerados vão para a pasta `saida/` (fora do controle do git) —
não commite vídeos no repositório.
