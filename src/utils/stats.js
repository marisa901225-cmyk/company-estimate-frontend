// 수주/진행 통계 계산 헬퍼
export const calculateStatsFromList = (dataList) => {
  const ongoing = dataList.filter(
    (p) => ['설계', '진행중', 'In Progress'].includes(p.status)
  ).length;

  const wonProjects = dataList.filter(
    (p) => ['계약', '제작', '납품', '완료', '수금', '수주', 'Won'].includes(p.status)
  );
  const won = wonProjects.length;

  let totalWonAmount = 0;
  let totalWonProfit = 0;

  wonProjects.forEach((p) => {
    const amount =
      p.contractAmount ||
      p.revisions?.[p.revisions.length - 1]?.amount ||
      0;

    totalWonAmount += amount;
    totalWonProfit += amount - (p.finalCost || 0);
  });

  const avgMargin =
    totalWonAmount > 0
      ? ((totalWonProfit / totalWonAmount) * 100).toFixed(1)
      : 0;

  return { ongoing, won, totalWonAmount, avgMargin };
};
