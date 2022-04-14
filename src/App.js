import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from "react";
import axios from 'axios';
import config from './config.json';
//REFRESH BREAKS THE TOKEN FROM LOCAL STORAGE

function App() {

  //Config
  const Client_ID = config.client_id;
  const Redirect_URI = config.redirect_uri;
  const Auth_Endpoint = config.auth_endpoint;
  const Response_type = config.response_type;

  const [token, settoken] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [info, setGenres] = useState([]);

  //id
  const [selected, setSelected] = useState('');
  //make key value pairs to save genres
  let hey = {};

  useEffect(() => {
    let hash = window.location.hash;
    let token = window.localStorage.getItem('token');
    console.log('let me see the token', token);
    if (!token) {
      let param = new URLSearchParams(hash);
      token = param.get('#access_token');
      window.location.hash = '';
      window.localStorage.setItem('token', token);

    }
    settoken(token);
    console.log(token);

  }, [])

  let logout = () => {
    settoken('');
    window.localStorage.removeItem('token');
  }

  let searchPlaylists = async (e) => {
    console.log('error');
    const { data } = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
    console.log(data);
    setPlaylists(data.items);


  }

  const displayInfo = async (e) => {
    // console.log('hey', e);
    hey = {};
    const { data } = await axios.get(`https://api.spotify.com/v1/playlists/${e.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    //mapping for the genre
    data.tracks.items.forEach(track => {
      get_genre(track.track);
    })

  }

  const get_genre = async (song) => {
    // join the artist ids
    let artists = [];
    song.artists.forEach(artist => {
      artists.push(artist.id);
    });
    const { data } = await axios.get(`https://api.spotify.com/v1/artists`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        ids: artists.join(','),
      }
    })
    data.artists.forEach(artist => {
      // console.log(artist.genres);
      artist.genres.forEach(genre => {
        //add genre
        hey[genre] = (hey[genre] + 1) || 1

      })
    })

    setGenres(hey);
  }


  const renderPlaylists = () => {
    return playlists.map(playlist => (
      <div key={playlist.name} onClick={() => displayInfo(playlist)}>
        hey {playlist.name}
      </div>
    ))
  }
  const renderGenres = () => {
    console.log(info, 'heyhey');
    // setTimeout(() => {
    //   for(var key in hey){
    //     console.log(key);
    //   }
    // }, 2000);
    console.log(hey);
    
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
        <div className='content'>
          <div className='Playlists-nav'>
            {renderPlaylists()}
          </div>
          <div className='actual-content'>
            {renderGenres()}

          </div>
        </div>
        
        <button onClick={searchPlaylists}> Playlists</button>
        {!token ? <h1>log in</h1> :
          null
        }
      </header>
    </div>
  );
}

export default App;
