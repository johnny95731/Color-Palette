/**
 * Sorted array in ascending order.
 */
import { quicksort } from './helpers';

export class AscendingArray<T> {
  arr: T[];
  length: number;
  
  constructor(arr: T[] = []) {
    this.arr = quicksort(arr);
    this.length = arr.length;
  }

  public get(idx: number) {
    return this.arr[idx];
  }
  /**
   * Push new value to array (automatically sorting).
   */
  public push(newVal: T) {
    let i = 0;
    for(; i < this.arr.length; i++) {
      if (newVal > this.arr[i]) break;
    }
    this.arr.splice(i, 0, newVal);
    this.length++;
  }

  /**
   * Remove value from array if it exists.
   * Returns the index of value, or -1 if value is not exists.
   */
  public remove(val: T) {
    let index = -1;
    for(let i = 0; i < this.arr.length; i++) {
      if (val < this.arr[i]) continue;
      else if (val === this.arr[i]) index = i;
      // else `val` is not found
      break;
    }
    if (index !== -1) {
      this.arr.splice(index, 1);
      this.length--;
    }
    return index;
  }

  public findIndex(val: T): number {
    for (let i = 0; i < this.arr.length; i++) {
      if (this.arr[i] === val) return i;
      else if (this.arr[i] > val) break;
    }
    return -1;
  }

  public includes(val: T): boolean {
    return this.findIndex(val) !== -1;
  }
}