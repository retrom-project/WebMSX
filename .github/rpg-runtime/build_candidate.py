"""Build only this fork's pinned source into a deterministic classic-script core."""
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

root = Path(__file__).resolve().parents[2]
out = Path(sys.argv[1])
if not out.is_absolute() or out.is_symlink() or not out.is_dir() or list(out.iterdir()):
    raise ValueError('PFB_CANDIDATE_OUTPUT_INVALID')
source_list = (root / 'gruntfile.js').read_text().split('var baseScr = [', 1)[1].split('];', 1)[0]
paths = ['src/main/WMSX.js', 'retrom/config.js'] + re.findall(r'"([^"]+\.js)"', source_list) + [
    'src/runtime/sysfiles/CompressedSystemFiles.js', 'src/runtime/sysfiles/EmbeddedSystemFiles.js',
    'src/main/Configurator.js', 'src/main/Launcher.js', 'retrom/checkpoint.js', 'retrom/layout.js', 'retrom/host.js']
(out / 'webmsx.js').write_text('\n;\n'.join((root / p).read_text() for p in paths) + '\n')
(out / 'UPSTREAM-NOTICE.txt').write_bytes((root / 'retrom/UPSTREAM-NOTICE.txt').read_bytes())
def git(*args):
    return subprocess.check_output(['git', '-C', str(root), *args]).decode().strip()
def sha(data):
    return hashlib.sha256(data).hexdigest()
files = [{'filename': p.name, 'sizeBytes': p.stat().st_size, 'sha256': sha(p.read_bytes())}
         for p in sorted(out.iterdir())]
names = sorted(set(git('ls-files', '-z', '--cached', '--others', '--exclude-standard').split('\0')) - {''})
hash_input = b''
for name in names:
    p = root / name
    if p.is_file():
        hash_input += name.encode() + b'\0' + sha(p.read_bytes()).encode() + b'\n'
descriptor = {'schemaVersion': 1, 'kind': 'RETROM_CORE_CANDIDATE_V1', 'coreId': 'webmsx',
              'repository': 'https://github.com/retrom-project/WebMSX', 'branch': git('branch', '--show-current'),
              'commit': git('rev-parse', 'HEAD'), 'dirty': bool(git('status', '--porcelain')),
              'sourceTreeSha256': sha(hash_input), 'adapterAbi': 'webmsx-host-v1', 'files': files}
(out / 'retrom-core-candidate.json').write_text(json.dumps(descriptor, sort_keys=True) + '\n')
print(json.dumps({'core': 'webmsx', 'files': files}))
