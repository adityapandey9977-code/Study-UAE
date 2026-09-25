/* eslint-disable react-hooks/exhaustive-deps */
export function NumberFormat({ value, fractionDigits = 2 }) {
    value = value * 1;
    const locale = 'en-IN';
    const format = { maximumFractionDigits: fractionDigits, minimumFractionDigits: fractionDigits, style: 'currency', currency: 'INR' };

    return (
        <>{value.toLocaleString(locale, format)}</>
    )
}

export function numFormat(value, currency = false, fractionDigits = 2) {
    const locale = 'en-IN';
    const format = { maximumFractionDigits: fractionDigits, minimumFractionDigits: fractionDigits };
    if (currency) {
        format.style = 'currency';
        format.currency = 'INR';
    }
    return value.toLocaleString(locale, format);
}