export function directoryToName(directory: string) {
  return directory.split(/[\/|\\|\:]/).filter(item => !!item).join('_');
}