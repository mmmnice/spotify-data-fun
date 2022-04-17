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
  let genre_counter = {};

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
    //reset
    genre_counter = {};
    const { data } = await axios.get(`https://api.spotify.com/v1/playlists/${e.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    //mapping for the genre
    data.tracks.items.forEach(track => {
      get_genre(track.track).then(() => {
        console.log('render thi');
        // renderGenres();
      });
    })

    // await renderGenres();


  }
  const sort_genres = async (data) => {
    data.artists.forEach(artist => {
      artist.genres.forEach(genre => {
        //add genre
        genre_counter[genre] = (genre_counter[genre] + 1) || 1

      })
    })
    return genre_counter;
 
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

    sort_genres(data).then((poopy) => {
      console.log(poopy);
      renderGenres();
      // console.log(info);
    });

  }


  const renderPlaylists = () => {
    return playlists.map(playlist => (
      <div key={playlist.name} onClick={() => displayInfo(playlist)}>
        hey {playlist.name}
      </div>
    ))
  }
  const renderGenres = async () => {
    console.log(genre_counter, 'heyhey');
    // console.log(get_gernes(), 'gernes');
    Object.entries(genre_counter).map(([k,v]) => {
      console.log(k, ' and ', v);
    })
    // setTimeout(() => {
    //   console.log(info);
    //   for(var key in info){
    //     console.log(key, 'new');
    //   }
    // }, 2000);
    // for(var key in info){
    //   console.log(key, 'new');
    // }
    // console.log(hey, 'the key');
    
  }
  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify Reaact</h1>
        {!token ? <a href={`${Auth_Endpoint}?client_id=${Client_ID}&redirect_uri=${Redirect_URI}&response_type=${Response_type}`}>
          Login in this </a> :
          <button onClick={logout}>logout</button>

        }
        {/* can separate this part to another component */}
        <div className='content'>
          <div className='Playlists-nav'>
            {renderPlaylists()}
          </div>
          <div className='actual-content'>
            {renderGenres}
            {/* <button onClick = {renderGenres}> populate</button> */}

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
