interface WinnerData {
    userId: string;
    seatNumber: number;
    amountWon: number;
    handName: string;
    potLabel?: string;
    isBigWin?: boolean;
}

interface PotGroup {
    potLabel: string | undefined;
    winners: WinnerData[];
    potTotal: number;
    isSplit: boolean;
}

function groupWinnersByPot(winners: WinnerData[]): PotGroup[] {
    const order: (string | undefined)[] = [];
    const buckets = new Map<string | undefined, WinnerData[]>();

    for (const winner of winners) {
        const key = winner.potLabel;
        if (!buckets.has(key)) {
            buckets.set(key, []);
            order.push(key);
        }
        buckets.get(key)!.push(winner);
    }

    return order.map(potLabel => {
        const groupWinners = buckets.get(potLabel)!;
        return {
            potLabel,
            winners: groupWinners,
            potTotal: groupWinners.reduce((sum, w) => sum + (w.amountWon || 0), 0),
            isSplit: groupWinners.length > 1,
        };
    });
}

const winners: WinnerData[] = [
    { userId: 'A', seatNumber: 1, amountWon: 3000, handName: 'Flush' },
    { userId: 'B', seatNumber: 2, amountWon: 2000, handName: 'Two Pair' }
];

console.log(JSON.stringify(groupWinnersByPot(winners), null, 2));
