import { DEBUG_RESET_CLASSES, DEFINITION_LOOKUP_TABLE, CSSClasses } from '@griffel/core';

export function print(val: unknown) {
  /**
   * test function makes sure that value is the guarded type
   */
  const _val = val as string;

  const regexParts: string[] = [];
  const regex = lookupRegex();

  if (!regex) {
    return _val;
  }

  let result: RegExpExecArray | null = null;

  while ((result = regex.exec(_val))) {
    const [name] = result;

    if (DEBUG_RESET_CLASSES[name]) {
      regexParts.push(name);
      continue;
    }

    const [definitions] = DEFINITION_LOOKUP_TABLE[name];

    /**
     * Collects all classNames present in a definition and adds it as part of a regular expression
     * @example
     * rules = ["f16th3vw", "frdkuqy0", "fat0sn40", "fjseox00"]
     */
    const rules = Object.keys(definitions).map(key => {
      const classes: CSSClasses = definitions[key];

      return Array.isArray(classes) ? classes.join('|') : classes;
    });
    regexParts.push(name, ...rules);
  }
  /**
   * form parts of regular expression and removes collected classNames from string
   * @example
   * regex = /f16th3vw|frdkuqy0|fat0sn40|fjseox00/
   */
  const valStrippedClassNames = _val.replace(new RegExp(regexParts.map(p => `${p}\\s?`).join('|'), 'g'), '').trim();

  /**
   * Trim whitespace from className
   */
  return `"${valStrippedClassNames.replace(/(class|className)="([^"]*)\s+"/, '$1="$2"')}"`;
}

export function test(val: unknown) {
  if (typeof val === 'string') {
    return lookupRegex()?.test(val) ?? false;
  }
  return false;
}

/**
 * lookupRegex returns all classNames definitions hat were generated by Griffel
 * in a single regex declaration
 *
 * @example
 * const useStyles = makeStyles({display: { display: 'none' } });
 *
 * lookupRegex() // /(__1qdh4ig)/g
 */
function lookupRegex(): RegExp | undefined {
  const definitionKeys = Object.keys({ ...DEFINITION_LOOKUP_TABLE, ...DEBUG_RESET_CLASSES });

  if (definitionKeys.length) {
    return new RegExp(`${definitionKeys.join('|')}`, 'g');
  }

  return undefined;
}
