import { useState } from "react";
import { Socket } from "socket.io-client";

interface Props {
  socket: Socket;
  setUsername: (username: string) => void;
}

const Username = ({ socket, setUsername }: Props) => {
  const [text, setText] = useState("");
  const [lang, setLang] = useState("francais");
  

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(text !== ""){
      setUsername(text);
      socket.emit("username-set", {
      username: text,
    });
    sessionStorage.setItem("lang", lang);
    } else {
      window.alert("saisissez un username et choisissez votre langue")
    };
  };

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLang(e.target.value);
    sessionStorage.setItem("lang", e.target.value);
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} >
        <label>Feature : </label><br></br>
        <label>Si le message est faux il apparaitra en rouge</label><br></br>
        <label>Traduisez les messages dans votre langue </label><br></br>
        <label>Auto-complétion </label><br></br>

        <input type="text" value={text} placeholder="username" className="input input-bordered input-primary w-full max-w-xs" onChange={(e) => setText(e.target.value) }/> 

        <select
          value={lang}
          onChange={handleLangChange}
          className="select select-bordered select-primary w-full max-w-xs mt-5"
        >
        <option value="francais">Français</option>
        <option value="english">English</option>
        </select>
       
        <div className="flex items-center justify-center m-5">
          <button className="btn btn-outline btn-primary flex items-center">Let's chat</button>
        </div>

      </form>
    </div>  
  );
};

export default Username;
