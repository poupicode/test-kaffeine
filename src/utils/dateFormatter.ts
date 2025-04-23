// Transform the date into a relative time (ex: At 12:32:05 AM)
export const formatTime = (date: Date) => {
    return "At " + date.toLocaleTimeString([], { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false });
}
