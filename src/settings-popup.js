import Sitelist from './sitelist.js';

const sitelist = new Sitelist(document.getElementById('list'));
const form = document.getElementById('form-newpattern');

sitelist.build();

const addNewPattern = () => {
  const input = document.getElementById('form-newpattern__patterninput');
  const loop = document.getElementById('form-newpattern__loopcheck').checked;

  if (input.value) sitelist.add(input.value, loop);
  
  input.value = '';
}

const setError = (error) => {
  if (error) document.getElementById('error').textContent = `Error: ${error}`;
}

const clearError = () => {
  document.getElementById('error').textContent = '';
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearError();

  try {
    addNewPattern();
  } catch (e) {
    setError(e.message)
  }
});