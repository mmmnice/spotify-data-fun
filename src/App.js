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
  const [searchKey, setSearchKey] = useState('');
  const [artists, setArtists] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  //id
  const [selected, setSelected] = useState('');
  //make key value pairs to save genres
  const hey = [];

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

  let searchArtists = async (e) => {
    e.preventDefault();
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
    setPlaylists(data.items);


  }

  const renderArtists = () => {
    if (!token) {
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
  const displayInfo = async (e) => {
    // console.log('hey', e);
    const { data } = await axios.get(`https://api.spotify.com/v1/playlists/${e.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    //mapping for the genre
    data.tracks.items.forEach(track => {
      console.log(track.track, 'the track');
      get_genre(track.track);
    })
    // get_artists(data);

  }


//Multiple artists can be present in each song
  // const get_artists = async (songs) => {
  //   const { data } = await axios.get(`https://api.spotify.com/v1/tracks/${songs.tracks.items[0].track.id}`, {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     }
  //   })
  //   console.log(data, 'tracks of the playlist')

  //   get_genre(data);
  // }


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
    console.log(data, 'lets see the data');
  }
  const renderPlaylists = () => {
    console.log(playlists);
    return playlists.map(playlist => (
      <div key = {playlist.name} onClick ={() => displayInfo(playlist)}>
        hey {playlist.name}
      </div>
    ))
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
        {renderPlaylists()}
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
