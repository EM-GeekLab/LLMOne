export function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return addLeadingZero(minutes) + ':' + addLeadingZero(remainingSeconds)
}

function addLeadingZero(num: number) {
  return num < 10 ? `0${num}` : num
}
