import {Sample1, Sample2, Sample3, Sample4, Sample5} from "./components";

const style = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '5%',
    marginBottom: '20%',
}

function App() {

    return (
        <div style={style}>
            <Sample1/>
            <Sample2/>
            <Sample3/>
            <Sample4/>
            <Sample5/>
        </div>
    );
}

export default App;
