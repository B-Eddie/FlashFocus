from flask import render_template
from app import app

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about-us.html')

@app.route('/highlightify')
def highlightify():
    return render_template('highlightify.html')

##hhh