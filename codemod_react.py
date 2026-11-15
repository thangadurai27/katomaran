import re, pathlib, sys

root = pathlib.Path(r'C:\College\katomaran\frontend\src')
changed = []
for p in root.rglob('*.jsx'):
    t = p.read_text(encoding='utf8')
    orig = t
    # remove pure default React import
    t = re.sub(r"^import React from 'react';\r?\n", "", t, count=1, flags=re.M)
    # convert "import React, { ... } from 'react';" -> named only
    def repl(m):
        names = [n.strip() for n in m.group(1).split(',') if n.strip()]
        return "import { " + ", ".join(names) + " } from 'react';"
    t = re.sub(r"^import React, \{([^}]*)\} from 'react';", repl, t, count=1, flags=re.M)
    if t != orig:
        p.write_text(t, encoding='utf8')
        changed.append(str(p))
print('\n'.join(changed))
