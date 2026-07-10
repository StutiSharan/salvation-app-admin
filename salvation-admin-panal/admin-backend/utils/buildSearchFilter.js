module.exports = (search, fields = []) => {
  if (!search?.trim()) {
    return {}
  }

  return {
    $or: fields.map((field) => ({
      [field]: {
        $regex: search.trim(),
        $options: "i",
      },
    })),
  }
}