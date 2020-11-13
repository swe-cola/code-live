from flaskapp import app
from flaskapp.garbage_collect import run_gc

if __name__ == '__main__':
    run_gc()
    app.run(host='0.0.0.0', port=1099, threaded=True)
