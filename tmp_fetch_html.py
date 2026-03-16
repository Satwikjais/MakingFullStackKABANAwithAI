import urllib.request
url = 'http://localhost:8000'
html = urllib.request.urlopen(url).read().decode('utf-8', errors='ignore')
print('has Chat:', 'Chat' in html)
print('snippet:', html[:2000])
