// Independent expectations transcribed from the hand calculations, not the scheduler.
export const A = [
  { id: 'P1', arrival: 0, burst: 8 }, { id: 'P2', arrival: 1, burst: 4 },
  { id: 'P3', arrival: 2, burst: 2 }, { id: 'P4', arrival: 4, burst: 1 },
];
export const B = [
  { id: 'P1', arrival: 2, burst: 3 }, { id: 'P2', arrival: 2, burst: 1 },
  { id: 'P3', arrival: 8, burst: 2 }, { id: 'P4', arrival: 9, burst: 1 },
];
// Rows: id, firstStart, completion, turnaround, waiting, response.
// Averages: turnaround, waiting, response.
export const cases = [
  { name: 'A FCFS', input: A, algorithm: 'FCFS',
    timeline: [['P1',0,8],['P2',8,12],['P3',12,14],['P4',14,15]],
    rows: [['P1',0,8,8,0,0],['P2',8,12,11,7,7],['P3',12,14,12,10,10],['P4',14,15,11,10,10]], averages: [10.5,6.75,6.75] },
  { name: 'A SJF', input: A, algorithm: 'SJF',
    timeline: [['P1',0,8],['P4',8,9],['P3',9,11],['P2',11,15]],
    rows: [['P1',0,8,8,0,0],['P2',11,15,14,10,10],['P3',9,11,9,7,7],['P4',8,9,5,4,4]], averages: [9,5.25,5.25] },
  { name: 'A SRTF', input: A, algorithm: 'SRTF',
    timeline: [['P1',0,1],['P2',1,2],['P3',2,4],['P4',4,5],['P2',5,8],['P1',8,15]],
    rows: [['P1',0,15,15,7,0],['P2',1,8,7,3,0],['P3',2,4,2,0,0],['P4',4,5,1,0,0]], averages: [6.25,2.5,0] },
  { name: 'A RR q=2', input: A, algorithm: 'RR', quantum: 2,
    timeline: [['P1',0,2],['P2',2,4],['P3',4,6],['P1',6,8],['P4',8,9],['P2',9,11],['P1',11,13],['P1',13,15]],
    rows: [['P1',0,15,15,7,0],['P2',2,11,10,6,1],['P3',4,6,4,2,2],['P4',8,9,5,4,4]], averages: [8.5,4.75,1.75] },
  { name: 'A RR q=1', input: A, algorithm: 'RR', quantum: 1,
    timeline: [['P1',0,1],['P2',1,2],['P1',2,3],['P3',3,4],['P2',4,5],['P1',5,6],['P4',6,7],['P3',7,8],['P2',8,9],['P1',9,10],['P2',10,11],['P1',11,12],['P1',12,13],['P1',13,14],['P1',14,15]],
    rows: [['P1',0,15,15,7,0],['P2',1,11,10,6,0],['P3',3,8,6,4,1],['P4',6,7,3,2,2]], averages: [8.5,4.75,.75] },
  { name: 'A RR q=4', input: A, algorithm: 'RR', quantum: 4,
    timeline: [['P1',0,4],['P2',4,8],['P3',8,10],['P4',10,11],['P1',11,15]],
    rows: [['P1',0,15,15,7,0],['P2',4,8,7,3,3],['P3',8,10,8,6,6],['P4',10,11,7,6,6]], averages: [9.25,5.5,3.75] },
  { name: 'B FCFS', input: B, algorithm: 'FCFS',
    timeline: [[null,0,2],['P1',2,5],['P2',5,6],[null,6,8],['P3',8,10],['P4',10,11]],
    rows: [['P1',2,5,3,0,0],['P2',5,6,4,3,3],['P3',8,10,2,0,0],['P4',10,11,2,1,1]], averages: [2.75,1,1] },
  { name: 'B SJF', input: B, algorithm: 'SJF',
    timeline: [[null,0,2],['P2',2,3],['P1',3,6],[null,6,8],['P3',8,10],['P4',10,11]],
    rows: [['P1',3,6,4,1,1],['P2',2,3,1,0,0],['P3',8,10,2,0,0],['P4',10,11,2,1,1]], averages: [2.25,.5,.5] },
  { name: 'B SRTF', input: B, algorithm: 'SRTF',
    timeline: [[null,0,2],['P2',2,3],['P1',3,6],[null,6,8],['P3',8,10],['P4',10,11]],
    rows: [['P1',3,6,4,1,1],['P2',2,3,1,0,0],['P3',8,10,2,0,0],['P4',10,11,2,1,1]], averages: [2.25,.5,.5] },
  { name: 'B RR q=2', input: B, algorithm: 'RR', quantum: 2,
    timeline: [[null,0,2],['P1',2,4],['P2',4,5],['P1',5,6],[null,6,8],['P3',8,10],['P4',10,11]],
    rows: [['P1',2,6,4,1,0],['P2',4,5,3,2,2],['P3',8,10,2,0,0],['P4',10,11,2,1,1]], averages: [2.75,1,.75] },
  { name: 'B RR q=1', input: B, algorithm: 'RR', quantum: 1,
    timeline: [[null,0,2],['P1',2,3],['P2',3,4],['P1',4,5],['P1',5,6],[null,6,8],['P3',8,9],['P4',9,10],['P3',10,11]],
    rows: [['P1',2,6,4,1,0],['P2',3,4,2,1,1],['P3',8,11,3,1,0],['P4',9,10,1,0,0]], averages: [2.5,.75,.25] },
  { name: 'B RR q=4', input: B, algorithm: 'RR', quantum: 4,
    timeline: [[null,0,2],['P1',2,5],['P2',5,6],[null,6,8],['P3',8,10],['P4',10,11]],
    rows: [['P1',2,5,3,0,0],['P2',5,6,4,3,3],['P3',8,10,2,0,0],['P4',10,11,2,1,1]], averages: [2.75,1,1] },
];
