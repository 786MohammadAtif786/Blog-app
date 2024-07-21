module.exports = (res, status, data, message, code) => {
  const result = {
    status
  }
  if (data) {
    result.data = data; 
  }
  if (message) {
    result.message = message;
  }
  if (code) {
    res.status(code);
  }
  res.json(result);
}