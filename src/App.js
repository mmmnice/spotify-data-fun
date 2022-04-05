import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from "react";
import axios from 'axios';

//REFRESH BREAKS THE TOKEN FROM LOCAL STORAGE

function App() {

 

  const [token, settoken] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    let hash = window.location.hash;
    let token = window.localStorage.getItem('token');
    if (!token) {
      let param = new URLSearchParams(hash);
      token = param.get('#access_token');
      window.location.hash = '';
      window.localStorage.setItem('token', token);

    }
    settoken(token);

  }, [])

  let logout = () => {
    settoken('');
    window.localStorage.removeItem('token');
  }

  let searchArtists = async (e) => {
    e.preventDefault();
    console.log(token);
    const { data } = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        q: searchKey,
        type: 'artist'
      }
    })
    setArtists(data.artists.items);
    console.log(data);
  }

  let searchPlaylists = async (e) => {
    console.log('error');
    const { data } = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    console.log(data);


  }

  const renderArtists = () => {
    console.log('try', token);
    if (!token) {
      console.log('im ')
      return null;
    } else {
      return artists.map(artist => (
        <div key={artist.id}>
          {artist.images.length ? <img width={"100%"} src={artist.images[0].url} alt="" /> : <div>No Image</div>}
          {artist.name}
        </div>
      ))
    }

  }
  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify Reaact</h1>
        {!token ? <a href={`${Auth_Endpoint}?client_id=${Client_ID}&redirect_uri=${Redirect_URI}&response_type=${Response_type}`}>
          Login in this bitch</a> :
          <button onClick={logout}>logout</button>

        }
        {/* can separate this part to another component */}
        {renderArtists()}
        <button onClick={searchPlaylists}> Playlists</button>
        {!token ? <h1>log in</h1> :
          <form onSubmit={searchArtists}>
            <input type='text' onChange={e => setSearchKey(e.target.value)}>

            </input>
            <button type={'submit'}>
              Search
            </button>
          </form>
        }
      </header>
    </div>
  );
}

export default App;
