import { useEffect, useState } from "react";
import axios from "axios";
function App() {

  const [note, setNote] = useState([
    
  ]);

  function getAllNotes() {
      axios.get("https://backend-lsko.onrender.com/api/notes").then((res) => {
      setNote(res.data.note);
      console.log(res.data);
    })
    }

  useEffect(() => {

    getAllNotes();
  
  }, []);

  function handleSubmit(e) {
    e.preventDefault();


    const {tittle, description} = e.target.elements

    console.log(tittle.value , description.value)

    axios.post("https://backend-lsko.onrender.com/api/notes",{
      tittle : tittle.value,
      description: description.value
    })
    .then(res =>{
      console.log(res.data);
      getAllNotes();
    })

    
  }


  function handleDelete(noteId) {
    axios.delete("https://backend-lsko.onrender.com/api/notes/" + noteId)
    .then(res =>{
      console.log(res.data);
      getAllNotes()
    })
  }


  

  return (
    <>

    <form onSubmit={handleSubmit}>
      <input name="tittle" type="text" placeholder="Enter Tittle" />
      <input name="description" type="text" placeholder="Enter Description" />
      <button >Create Note</button>

    </form>



      {note.map((note, idx) => {
        return (
          <div key={idx} className="notes">
            <div className="note">
              <h1>{note.tittle}</h1>
              <p>{note.description}</p>
              <button onClick={()=>{
                handleDelete(note._id)
              }}>Delete</button>
            </div>
          </div>
        );
      })}
    </>
  );
}

export default App;
