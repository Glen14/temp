const express = require('express');
const fs = require('fs');
const exphbs = require('express-handlebars');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5500;

const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        highlightBlankMetascore: metascore => metascore === "" || metascore === "N/A",
        hasMetascore: metascore => metascore && metascore !== "N/A" && metascore !== "",
        json: context => JSON.stringify(context, null, 2),
        formatDate: dateString => new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    }
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));

let movieData;
fs.readFile('movie-dataset-a2.json', 'utf8', (err, data) => {
    if (err) console.error('Error reading the movie data file:', err);
    try {
        movieData = JSON.parse(data);
        console.log('JSON data is loaded and ready!');
        console.log(`Loaded ${movieData.length} movies.`);
    } catch (parseError) {
        console.error('Error parsing JSON data:', parseError);
    }
});

app.get('/', (req, res) => {
    res.render('home', { title: 'Welcome', name: 'Glen Correia', studentId: 'N01615526' });
});

app.get('/data', (req, res) => {
    res.render('data', { title: 'Movie Data', message: 'JSON data is loaded and ready!' });
});

app.get('/data/movie/:index', (req, res) => {
    const index = parseInt(req.params.index);
    if (isNaN(index) || index < 0 || index >= movieData.length) {
        res.status(404).render('error', { title: '404 Not Found', message: 'Invalid movie index.' });
    } else {
        const movie = movieData[index];
        res.render('movie', { title: 'Movie Details', movieId: movie.Movie_ID, movieTitle: movie.Title });
    }
});

app.get('/data/search/id/', (req, res) => {
    res.render('searchById', { title: 'Search by Movie ID' });
});

app.get('/data/search/id/result', (req, res) => {
    const movieID = parseInt(req.query.movie_id);
    if (isNaN(movieID)) {
        res.status(404).render('error', { title: '404 Not Found', message: 'Invalid movie ID.' });
    } else {
        const movie = movieData.find(m => m.Movie_ID === movieID);
        if (movie) {
            res.render('searchResults', { title: 'Movie Found', movie: movie });
        } else {
            res.status(404).render('error', { title: '404 Not Found', message: 'The movie ID you entered does not exist.' });
        }
    }
});

app.get('/data/search/title/', (req, res) => {
    res.render('searchByTitle', { title: 'Search by Movie Title' });
});

app.get('/data/search/title/result', (req, res) => {
    const searchTitle = req.query.movie_title.toLowerCase();
    const matchingMovies = movieData.filter(movie => movie.Title.toLowerCase().includes(searchTitle));
    res.render('searchResults', { title: 'Search Results', movies: matchingMovies, searchTerm: req.query.movie_title });
});

app.get('/allData', (req, res) => {
    res.render('allData', { title: 'All Movie Data', movies: movieData });
});

app.get('/filteredData', (req, res) => {
    res.render('filteredData', { title: 'Filtered Movie Data', movies: movieData });
});

app.get('/highlightedData', (req, res) => {
    res.render('highlightedData', { title: 'Highlighted Movie Data', movies: movieData });
});

app.get('/pg13', (req, res) => {
    const pg13Movies = movieData.filter(movie => movie.Rated === 'PG-13');
    res.render('pg13', { title: 'PG-13 Movies', movies: pg13Movies });
});

app.use((req, res) => {
    res.status(404).render('error', { title: '404 Not Found', message: 'The page you are looking for does not exist.' });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});