export function showContents(ids) {
  ids.forEach((id) => {
    document.getElementById(id).style.display = "";
  });
}

export function hideContents(ids) {
  ids.forEach((id) => {
    document.getElementById(id).style.display = "none";
  });
}
