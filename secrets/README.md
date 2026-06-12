# Local Secret Files

Keep real secret values in `*.txt` files in this directory. Those files are ignored by Git.

Create these local files before running Compose:

- `mongo_root_username.txt`
- `mongo_root_password.txt`
- `mongo_app_username.txt`
- `mongo_app_password.txt`
- `redis_password.txt`

Use the matching `*.example` files as placeholders only. Rotate any value that was ever committed or shared.
