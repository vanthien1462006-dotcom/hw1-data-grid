import type { Member } from './contract.ts';

// The city of member 12 is an XSS sample. It must render as plain text.
export const members: Member[] = [
  { id: '1', name: 'Alice Nguyen', role: 'Designer', city: 'Hanoi', score: 88 },
  { id: '2', name: 'Bob Tran', role: 'Developer', city: 'Da Nang', score: 72 },
  { id: '3', name: 'Carol Le', role: 'Developer', city: 'Hue', score: 95 },
  { id: '4', name: 'David Pham', role: 'Tester', city: 'Hanoi', score: 60 },
  { id: '5', name: 'Eve Do', role: 'Designer', city: 'Ho Chi Minh City', score: 81 },
  { id: '6', name: 'Frank Vo', role: 'Manager', city: 'Hanoi', score: 90 },
  { id: '7', name: 'Grace Ly', role: 'Developer', city: 'Can Tho', score: 77 },
  { id: '8', name: 'Henry Bui', role: 'Analyst', city: 'Hai Phong', score: 69 },
  { id: '9', name: 'Ivy Dang', role: 'Tester', city: 'Hue', score: 84 },
  { id: '10', name: 'Jack Ho', role: 'Developer', city: 'Hanoi', score: 91 },
  { id: '11', name: 'Kim Mai', role: 'Manager', city: 'Da Nang', score: 66 },
  { id: '12', name: 'Leo Truong', role: 'Analyst', city: '<img src=x onerror=alert(1)>', score: 78 },
];
