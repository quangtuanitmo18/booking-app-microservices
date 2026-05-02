import Joi from 'joi';
import {ApiBearerAuth, ApiResponse, ApiTags} from "@nestjs/swagger";
import {JwtGuard} from "building-blocks/passport/jwt.guard";
import {Controller, Get, Inject, NotFoundException, Req, UseGuards} from "@nestjs/common";
import {IQueryHandler, QueryBus, QueryHandler} from "@nestjs/cqrs";
import {PassengerDto} from '@/passenger/dtos/passenger.dto';
import {IPassengerRepository} from '@/data/repositories/passenger.repository';
import {Passenger} from '@/passenger/entities/passenger.entity';
import mapper from "@/passenger/mappings";

export class GetPassengerByMe {
    userId: number;

    constructor(request: Partial<GetPassengerByMe> = {}) {
        Object.assign(this, request);
    }
}

const getPassengerByMeValidations = {
    params: Joi.object().keys({
        userId: Joi.number().integer().required()
    })
};

@ApiBearerAuth()
@ApiTags('Passengers')
@Controller({
    path: `/passenger`,
    version: '1',
})
export class GetPassengerByMeController {

    constructor(private readonly queryBus: QueryBus) {
    }
    
    @Get('me')
    @UseGuards(JwtGuard)
    @ApiResponse({status: 200, description: 'OK'})
    @ApiResponse({status: 401, description: 'UNAUTHORIZED'})
    @ApiResponse({status: 400, description: 'BAD_REQUEST'})
    @ApiResponse({status: 403, description: 'FORBIDDEN'})
    public async getPassengerByMe(@Req() req: any): Promise<PassengerDto> {
        const userId = req.user?.userId;
        if (!userId) {
            throw new NotFoundException('User ID not found in token');
        }

        const result = await this.queryBus.execute(
            new GetPassengerByMe({
                userId: userId
            })
        );

        if (!result) {
            throw new NotFoundException('Passenger not found');
        }
        return result;
    }
}

@QueryHandler(GetPassengerByMe)
export class GetPassengerByMeHandler implements IQueryHandler<GetPassengerByMe> {
    constructor(@Inject('IPassengerRepository') private readonly passengerRepository: IPassengerRepository) {}

    async execute(query: GetPassengerByMe): Promise<PassengerDto> {
        await getPassengerByMeValidations.params.validateAsync(query);

        const passengerEntity = await this.passengerRepository.findPassengerByUserId(query.userId);

        if (!passengerEntity) {
            return null;
        }

        const result = mapper.map<Passenger, PassengerDto>(passengerEntity, new PassengerDto());

        return result;
    }
}
