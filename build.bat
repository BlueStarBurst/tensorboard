cd ./jupyterlite-tensorboard
call ./Scripts/activate && jupyter lite build --contents content --output-dir ../jupyter
rm ../jupyter/lab/index.html
rm ../jupyter/jupyter-lite.json
cp ../jupyter-lite.json ../jupyter