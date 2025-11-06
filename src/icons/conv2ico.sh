ffmpeg -i input.png -filter_complex \
"[0:v]scale=16:16[ico1]; \
 [0:v]scale=32:32[ico2]; \
 [0:v]scale=48:48[ico3]; \
 [0:v]scale=64:64[ico4]; \
 [0:v]scale=128:128[ico5]; \
 [0:v]scale=256:256[ico6]" \
-map [ico1] -map [ico2] -map [ico3] -map [ico4] -map [ico5] -map [ico6] favicon.ico

