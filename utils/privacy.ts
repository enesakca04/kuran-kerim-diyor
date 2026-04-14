export const maskName = (name: string): string => {
    if (!name) return 'A***';
    const parts = name.trim().split(' ');
    
    if (parts.length === 1) {
        const first = parts[0];
        if (first.length <= 1) return first + '***';
        return first[0] + '***';
    }

    const first = parts[0];
    const last = parts[parts.length - 1];

    return `${first[0]}*** ${last[0]}***`;
};
