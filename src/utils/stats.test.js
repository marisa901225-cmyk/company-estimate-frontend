import { calculateStatsFromList } from './stats';

test('empty projects have zero statistics', () => {
  expect(calculateStatsFromList([])).toEqual({
    ongoing: 0,
    won: 0,
    totalWonAmount: 0,
    avgMargin: 0,
  });
});

test.each(['보류', 'Hold', '실주', 'Lost', undefined, ''])(
  '%s is excluded from ongoing and won statistics',
  (status) => {
    expect(calculateStatsFromList([{ status, contractAmount: 100 }])).toEqual({
      ongoing: 0,
      won: 0,
      totalWonAmount: 0,
      avgMargin: 0,
    });
  }
);

test.each(['설계', '진행중', 'In Progress'])(
  '%s counts as an ongoing quotation',
  (status) => {
    expect(calculateStatsFromList([{ status, contractAmount: 100 }])).toEqual({
      ongoing: 1,
      won: 0,
      totalWonAmount: 0,
      avgMargin: 0,
    });
  }
);

test.each(['계약', '제작', '납품', '완료', '수금', '수주', 'Won'])(
  '%s contributes to won count, amount and margin',
  (status) => {
    const project = { status, contractAmount: 100, finalCost: 75 };
    expect(calculateStatsFromList([project])).toEqual({
      ongoing: 0,
      won: 1,
      totalWonAmount: 100,
      avgMargin: '25.0',
    });
  }
);

test('zero-value won projects do not produce an invalid margin', () => {
  expect(calculateStatsFromList([{ status: '계약', contractAmount: 0 }])).toEqual({
    ongoing: 0,
    won: 1,
    totalWonAmount: 0,
    avgMargin: 0,
  });
});

test('mixed stages preserve weighted margin and latest-revision amount', () => {
  const projects = [
    { status: '설계', contractAmount: 900 },
    { status: '계약', contractAmount: 100, finalCost: 60 },
    { status: '제작', contractAmount: 200, finalCost: 150 },
    { status: '납품', contractAmount: 0, revisions: [{ amount: 400 }, { amount: 300 }], finalCost: 210 },
    { status: '완료', contractAmount: 400, finalCost: 400 },
    { status: '보류', contractAmount: 10000 },
  ];
  const before = JSON.stringify(projects);

  expect(calculateStatsFromList(projects)).toEqual({
    ongoing: 1,
    won: 4,
    totalWonAmount: 1000,
    avgMargin: '18.0',
  });
  expect(JSON.stringify(projects)).toBe(before);
});
