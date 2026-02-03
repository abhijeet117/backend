import { useState } from "react";
import axios from "axios";
function App() {
  const [note, setNote] = useState([
    axios.get('http://localhost:3000/api/notes')
  .then((res)=>{
    setNote(res.data.note)
    console.log(res.data)
  })
  ]);

  

  return (
    <>
      {note.map((note, idx) => {
        return (
          <div key={idx} className="notes">
            <div className="note">
              <h1>{note.tittle}</h1>
              <p>{note.description}</p>
            </div>
          </div>
        );
      })}
    </>
  );
}

export default App;
