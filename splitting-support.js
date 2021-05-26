
const {Vector3} = require('@grunmouse/math-vector');
const {SquareMatrix3, SquareMatrix, Matrix} = require('@grunmouse/math-matrix');

/**
 * @typedef <Object> SupportStruct
 * @property point: Vector3 - точка опоры
 * @property glide: ?(Vector3|Array<Vector3>) - степень свободы, заданная направляющими
 * @property normal: ?(Vector3) - степень свободы вдоль плоскости, заданная нормалью
 */

function StructSupport(raw){
	if(raw instanceof Vector3){
		return {point:raw, glide:[]};
	}
	else{
		let {point, glide, normal} = raw;
		if(normal){
			let a = normal.someNormal(), b = a.cross(normal); //Проверить порядок операндов
			glide = [a,b];
		}
		else if(!glide){
			glide = [];
		}
		else if(glide instanceof Vector3){
			glide = [glide];
		}
		return {point, glide};
	}
}


/**
 * Разложение реакции опоры на три шарнира
 * @param supports : Array[3]<(Vector3|SupportStruct)> - точка опоры и оставленные ей степени свободы
 */
function splittingSupport(supports, F, M){
	supports = supports.map(StructSupport);
	let control = supports.reduce((count, support)=>(count+support.glide.length), 0);
	if(control!==3){
		throw new Error('System is not solvable');
	}
	const E3 = SquareMatrix.E(3);
	const hatP = [];
	const gRows = [];
	for(let i=0;i<supports.lenght; ++i){
		let support = supports[i];
		hatP[i] = SquareMatrix3.hat(support.point);
		
		for(let b of support.glide){
			let row = Array(9).fill(0);
			row.splice(i*3, 3, ...b);
			gRows.push(Matrix.row(row));
		}
	}
	
	const A = Matrix.concat([
		Matrix.rowconcat([E3,E3,E3]), 
		Matrix.rowconcat(hatP),
		...gRows
	]);
	
	const B = Matrix.column([...(F.neg()), ...(M.neg()), 0,0,0]); 
	
	const invA = A.inverse();
	
	const X = invA.mul(B);
	
	let S = [
		new Vector3(...X.slice(0, 3)),
		new Vector3(...X.slice(3, 6)),
		new Vector3(...X.slice(6, 9)),
	];
	
	return S;
}

module.exports = splittingSupport;