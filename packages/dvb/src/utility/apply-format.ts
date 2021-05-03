import dayjs from 'dayjs';

export function applyFormat(format: string, dictionary: { [ key: string ]: string }, now: number) {
  const split = format.split(/\$/).join('$$').split(/\\\$\$/).join('$').split('$$');
  for (let i = 1; i < split.length; ++i) {
    const endIndex = split[i].indexOf('}');
    if (split[i].startsWith('{') && endIndex !== -1) {
      const variableName = split[i].substr(1, endIndex - 1);
      let insert = `\${${variableName}}`;
      if (variableName.startsWith('date:')) {
        const format = variableName.substr(5);
        insert = format ? dayjs(now).format(format) : '';
      } else {
        const value = dictionary[variableName];
        insert = value === undefined ? insert : value;
      }
      split[i] = `${insert}${split[i].substr(endIndex + 1)}`;
    } else {
      split[i] = `$${split[i]}`;
    }
  }
  return split.join('');
}