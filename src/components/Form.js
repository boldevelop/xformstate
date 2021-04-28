const upperDivStyle = { marginTop: '2rem'}
const wrapperDivStyle = {display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}
const titleStyle = {fontWeight: 400, textAlign: 'center'};
const zeroMargin = { margin: 0};
const preStyle = {
    marginBottom: '2rem',
    background: '#2c2c2c',
    color: '#fff',
}
export const Form = ({children, title, onSubmit, code}) => {
    return (
        <>
            <div style={upperDivStyle}>
                <h3 style={titleStyle}>{title}</h3>
                <form onSubmit={onSubmit}>
                    <div style={wrapperDivStyle}>
                        {children}
                    </div>
                </form>
                <pre style={preStyle}><code style={{ fontSize: 12 }}>{code}</code></pre>

                <hr style={zeroMargin}/>
            </div>

        </>
    )
}