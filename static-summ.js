let Vector = require('@grunmouse/math-vector').Vector3;

/**
 * Суммирование известных сил
 * Расчёт равнодействующей силы и момента относительно точки отсчёта.
 * @param forces : Array<[Vector, Vector]> - массив пар векторов, где первый вектор - точка приложения, а второй - приложенная сила
 * @return {M: Vector, F: Vector}
 */
function forceSumm(forces){
	let F = Vector.O();
	let M = Vector.O();
	forces.forEach(([point, force], i)=>{
		F = F.add(force);
		let m = point.cross(force);
		M = M.add(m);
	});
	
	return {
		F,
		M
	};
}


module.exports = forceSumm;