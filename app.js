  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
  import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-database.js"

  const firebaseConfig = {
    apiKey: "AIzaSyB7jJYYkMFR9bCiYkQfHFNynUhVMp7oInU",
    authDomain: "vector-54c00.firebaseapp.com",
    projectId: "vector-54c00",
    storageBucket: "vector-54c00.appspot.com",
    messagingSenderId: "559110889150",
    appId: "1:559110889150:web:535316ecae3f1331d588ef",
    databaseURL: "https://vector-54c00-default-rtdb.europe-west1.firebasedatabase.app",
  };

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);



  const buttons = document.querySelectorAll('.vectorButtonWrapper button')
  const buttonsWrappers = document.querySelectorAll('.vectorButtonWrapper')
  const votesData = {}

  const getActualVotes = async (fromButton) => {
    try {
      const snapshot = await get(ref(db, 'votes'))
      if (snapshot.exists()) {
        Object.entries(snapshot.val()).forEach(([snapKey, snapValue]) => {
          if (snapKey && snapValue && snapValue.votes) {
            votesData[snapKey] = snapValue.votes
          }
        })

        const isVoted = getCookie('user-vector-voted')

        if (!fromButton && isVoted) {
          buttons.forEach(button => {
            const teamType = button.dataset.team
            button.innerHTML = `Голосів: ${votesData[teamType] || 0}`
          })
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  const onButtonClick = async (teamType) => {
    const date = new Date()
    date.setDate(date.getDate() + 100);

    try {
      await getActualVotes(true)

      if (votesData[teamType]) {
        votesData[teamType] = votesData[teamType] + 1

        set(ref(db, 'votes/' + teamType), {
          votes: votesData[teamType],
        });

        setCookie('user-vector-voted', true, {
          expires: date
        })

        buttonsWrappers.forEach(wrapper => {
          wrapper.classList.add('disabledButtonWrapper')
        })

        buttons.forEach(button => {
          const teamTypeSet = button.dataset.team
          button.innerHTML = `Голосів: ${votesData[teamTypeSet] || 0}`
        })
      }
    } catch (e) {
      console.log(e)
    }
  }

  window.addEventListener('load', () => {
    const isVoted = getCookie('user-vector-voted')

    if (!isVoted) {
      buttonsWrappers.forEach(wrapper => {
        wrapper.classList.remove('disabledButtonWrapper')
      })
      buttons.forEach(button => {
        const teamType = button.dataset.team
        button.addEventListener('click', () => {
          onButtonClick(teamType)
        })
      })
    }
    
    getActualVotes(false)
  })

  function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
  }

  function setCookie(name, value, options = {}) {
    options = {
      path: '/',
      ...options
    };

    if (options.expires instanceof Date) {
      options.expires = options.expires.toUTCString();
    }

    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

    for (let optionKey in options) {
      updatedCookie += "; " + optionKey;
      let optionValue = options[optionKey];
      if (optionValue !== true) {
        updatedCookie += "=" + optionValue;
      }
    }

    document.cookie = updatedCookie;
  }