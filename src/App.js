import {Sample1} from "./components";

const style =  {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '5%',
}

function App() {

    return (
        <div style={style}>
            <Sample1 id={1}/>
            <Sample1 id={2}/>
            <Sample1 id={3}/>
        </div>
    );
}

export default App;
