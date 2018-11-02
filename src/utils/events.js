// @flow
import { isCallable } from './index';

export const isEvent = (evt: any): boolean => {
  return (typeof Event !== 'undefined' && isCallable(Event) && evt instanceof Event) || (evt && evt.srcElement);
};

export const normalizeEvents = (evts: string | string[]): string[] => {
  return (typeof evts === 'string' ? evts.split('|') : evts);
};
