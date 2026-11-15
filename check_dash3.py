import urllib.request

r = urllib.request.urlopen('https://katomaran-eight.vercel.app/assets/DashboardOverview-DPem7PuP.js')
body = r.read().decode('utf8', 'replace')
print(body[:6000])
