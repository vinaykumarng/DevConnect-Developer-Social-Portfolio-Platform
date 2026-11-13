export function timeAgo(date) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    const steps = [
        ['y', 31536000],
        ['mo', 2592000],
        ['d', 86400],
        ['h', 3600],
        ['m', 60],
    ];
    for (const [label, secs] of steps) {
        const count = Math.floor(seconds / secs);
        if (count >= 1) return `${count}${label}`;
    }
    return 'now';
}
