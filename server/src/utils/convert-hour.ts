


export function convertHour(hourString: string) {
  const [hours, minutes] = hourString.split(':').map(Number)

  const minutesAmout = (hours * 60) + minutes;

  return minutesAmout
}