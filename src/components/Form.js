const upperDivStyle = {marginBottom: '1rem'}
const wrapperDivStyle = {display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}
const titleStyle = {fontWeight: 400};

export const Form = ({children, title, onSubmit}) => {
    return (
        <div style={upperDivStyle}>
            <h3 style={titleStyle}>{title}</h3>
            <form onSubmit={onSubmit}>
                <div style={wrapperDivStyle}>
                    {children}
                </div>
            </form>
        </div>
    )
}