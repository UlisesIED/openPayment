"use client";
import image from './assets/images/yo merengue.jpeg'
import Image from 'next/image';
import './app.scss'

export default function Page() {
  return (
    <div className='conteiner-login'>
      <div className="wrapper fadeInDown">
        <div id="formContent">
          <div className="fadeIn first">
            <Image 
              src={image} 
              alt="El voluntariado papu"
              width={100}
              height={100}
              placeholder="blur" 
            />
          </div>

          <form onSubmit={() => console.log("Hola amigo")} className='formStyle'>
            <input type="text" id="login" className="fadeIn second" name="login" placeholder="usuario" onChange={(e) => console.log("Hola amigo")} />
            <input type="password" id="password" className="fadeIn third" name="password" placeholder="contraseña" onChange={(e) => console.log("Hola amigo")} />
            <input type="submit" className="fadeIn fourth" value="ingresar" />
          </form>

          <div id="formFooter">
            <a className="underlineHover">Los voluntarios a la fuerza - 2025</a>
          </div>

        </div>
      </div>
    </div>
  );
}
