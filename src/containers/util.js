
const o_date = new Intl.DateTimeFormat('de-de', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
});
const f_date = (m_ca, m_it) => Object({...m_ca, [m_it.type]: m_it.value});
export const formatDDMMYYYY = date => {
    const d = o_date.formatToParts(date).reduce(f_date, {});
    return d.day + '.' + d.month + '.' + d.year
}

export const formatHHMM = date => {
    const d = o_date.formatToParts(date).reduce(f_date, {});
    return d.hour + ':' + d.minute
}