export const Input = ({id, onChange, label, error, value, placeholder = 'Type smth...'}) => {
    const styleInput = { marginBottom: error ? 0 : 15 }
    return (
        <div style={{marginBottom: '.1rem'}}>
            <label htmlFor={id}>{label}:</label><br/>
            <input type="text" value={value} onChange={onChange} placeholder={placeholder} style={styleInput}/>
            {error && <p style={{color: 'red', margin: 0, marginBottom: '.5rem', fontSize: 13}}>{error}</p>}
        </div>
    )
}