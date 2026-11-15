import urllib.request

base = 'https://katomaran-eight.vercel.app'
r = urllib.request.urlopen(base + '/sw.js')
print(r.read().decode())
