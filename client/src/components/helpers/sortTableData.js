const sortTableData = (array, {sortBy, dir}) => {
	return array.sort((x, y) => {
		if (x[sortBy] < y[sortBy]) return dir === 'asc' ? -1 : 1
		if (x[sortBy] > y[sortBy]) return dir === 'asc' ? 1 : -1
		return 0
	})
}

export default sortTableData;