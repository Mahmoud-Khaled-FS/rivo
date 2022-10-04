import { unlink, rmSync } from 'fs';
import { join } from 'path';
const remove = (path: string, isDir?: boolean) => {
  if (!isDir) {
    return unlink(join(__dirname, '..', '..', 'uploads', path), () => {});
  }
  return rmSync(join(__dirname, '..', '..', 'uploads', path), { recursive: true, force: true });
};

export default remove;
